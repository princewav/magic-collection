import { CollectionCard } from '@/types/card';
import { BaseService } from './BaseService';
import { DB } from '../db';
import { RepoCls } from '../db';
import { CardFilteringService, FilterOptions } from './CardFilteringService';
import { Card } from '@/types/card';
import { Document, ObjectId } from 'mongodb';

export class CollectionCardService extends BaseService<CollectionCard> {
  public repo = new RepoCls<CollectionCard>(DB, 'collection-cards');
  private cardsRepo = new RepoCls<Card>(DB, 'cards');
  private filteringService: CardFilteringService;

  constructor(filteringService: CardFilteringService) {
    super();
    this.filteringService = filteringService;
  }

  async getByType(type: 'paper' | 'arena') {
    return this.repo.findBy({ collectionType: type });
  }

  async getByCardId(ids: string[]): Promise<CollectionCard[] | null> {
    const cursor = this.repo.collection.find({ cardId: { $in: ids } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }
  async getByCardNames(names: string[]): Promise<CollectionCard[] | null> {
    const cardDocs = await this.cardsRepo.collection
      .find({ name: { $in: names } }, { projection: { id: 1 } })
      .toArray();
    const cardIds = cardDocs.map((doc) => doc.id).filter((id) => id);

    if (cardIds.length === 0) return [];

    const cursor = this.repo.collection.find({ cardId: { $in: cardIds } });
    const docs = await cursor.toArray();
    return docs.map(({ _id, ...doc }) => ({
      id: _id.toString(),
      ...doc,
    })) as unknown as CollectionCard[];
  }

  async getFilteredCardsWithPagination(
    filters: FilterOptions,
    page: number = 1,
    pageSize: number = 50,
    deduplicate: boolean = true,
  ): Promise<{ cards: CollectionCard[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const basePipeline: Document[] = [
      {
        $lookup: {
          from: 'cards',
          localField: 'cardId',
          foreignField: 'id',
          as: 'cardData',
        },
      },
      { $unwind: { path: '$cardData', preserveNullAndEmptyArrays: false } },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$cardData', '$$ROOT'],
          },
        },
      },
      { $project: { cardData: 0 } },
      { $match: this.filteringService.buildFilterQuery(filters) },
    ];

    const needsCustomSort = (this.filteringService as any)[
      '_needsCustomSorting'
    ](filters);
    const sortSpec = (this.filteringService as any)['_buildSortStage'](filters);

    let sortStages: Document[] = [];
    if (needsCustomSort) {
      sortStages.push(
        ...(this.filteringService as any)['_buildCustomSortStages'](filters),
      );
    }
    sortStages.push({
      $addFields: {
        _collectorNumberNumeric: {
          $convert: {
            input: '$collector_number',
            to: 'int',
            onError: 999999,
            onNull: 999999,
          },
        },
      },
    });
    sortStages.push({ $sort: sortSpec });

    let deduplicationStages: Document[] = [];
    if (deduplicate) {
      deduplicationStages = [
        {
          $group: {
            _id: '$name',
            firstDoc: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$firstDoc' } },
      ];
    }

    const finalProjectFields: Record<string, 0> = {
      _collectorNumberNumeric: 0,
    };
    if (needsCustomSort) {
      if (filters.sortFields?.some((f) => f.field === 'rarity'))
        finalProjectFields._rarityIndex = 0;
      if (filters.sortFields?.some((f) => f.field === 'colors')) {
        finalProjectFields._colorIndex = 0;
        finalProjectFields._colorCategory = 0;
        finalProjectFields._colorsArray = 0;
      }
    }
    const finalProjectionStage =
      Object.keys(finalProjectFields).length > 0
        ? [{ $project: finalProjectFields }]
        : [];

    const fetchPipeline: Document[] = [
      ...basePipeline,
      ...sortStages,
      ...deduplicationStages,
      ...finalProjectionStage,
      { $skip: skip },
      { $limit: limit },
    ];

    const countPipeline: Document[] = [
      ...basePipeline,
      ...(deduplicate ? [...sortStages, { $group: { _id: '$name' } }] : []),
      { $count: 'total' },
    ];

    const fetchDocsPromise = this.repo.collection
      .aggregate(fetchPipeline)
      .toArray();
    const countResultPromise = this.repo.collection
      .aggregate(countPipeline)
      .toArray();

    const [docs, countResult] = await Promise.all([
      fetchDocsPromise,
      countResultPromise,
    ]);

    const docsWithIds = docs.map((doc) => {
      const { _id, ...rest } = doc as any;
      return {
        ...rest,
        id: (_id as ObjectId).toString(),
      } as CollectionCard;
    });

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return { cards: docsWithIds, total: total };
  }
}

const filteringService = new CardFilteringService();
export const collectionCardService = new CollectionCardService(
  filteringService,
);
