import { POUCHDB_PATH } from "@/lib/constants";
import { PouchDbRepository } from "./repositories/PouchDbRepository";
import PouchDB from 'pouchdb';

export const DB = new PouchDB(POUCHDB_PATH);
export const RepoCls = PouchDbRepository;

