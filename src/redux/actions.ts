import {
  ADD_ACL_CID,
  ADD_DEP_CID,
  DELETE_ACL_CID,
  DELETE_DEP_CID,
  SET_ACL_CID_LIST,
  SET_ACL_MANUAL_POSTING,
  SET_ACL_SORT,
  SET_ARTCC_ID,
  SET_DEP_CID_LIST,
  SET_DEP_MANUAL_POSTING,
  SET_DEP_SORT,
  SET_REFERENCE_FIXES,
  SET_SECTOR_DATA,
  SET_SECTOR_ID,
  TOGGLE_SECTOR
} from './actionTypes';
import {SectorDataType} from "../types";
import {polygon} from "@turf/turf";

export const addAclCid = (cid: string) => ({
  type: ADD_ACL_CID,
  payload: {cid: cid}
});

export const deleteAclCid = (cid: string) => ({
  type: DELETE_ACL_CID,
  payload: {cid: cid}
});

export const setAclCidList = (cidList: string[], deletedList: string[]) => ({
  type: SET_ACL_CID_LIST,
  payload: {cidList: cidList, deletedList: deletedList}
});

export const addDepCid = (cid: string) => ({
  type: ADD_DEP_CID,
  payload: {cid: cid}
});

export const deleteDepCid = (cid: string) => ({
  type: DELETE_DEP_CID,
  payload: {cid: cid}
});

export const setDepCidList = (cidList: string[], deletedList: string[]) => ({
  type: SET_DEP_CID_LIST,
  payload: { cidList: cidList, deletedList: deletedList }
});

export const setAclSort = (name: string, sector: boolean) => ({type: SET_ACL_SORT, payload: {name: name, sector: sector}});
export const setDepSort = (name: string) => ({type: SET_DEP_SORT, payload: {name: name, sector: false}});
export const setAclPosting = (value: boolean) => ({type: SET_ACL_MANUAL_POSTING, payload: {manualPosting: value}});
export const setDepPosting = (value: boolean) => ({type: SET_DEP_MANUAL_POSTING, payload: {manualPosting: value}});

export const setSectors = (sectors: SectorDataType[]) => ({
  type: SET_SECTOR_DATA,
  payload: Object.fromEntries(sectors.map((sector: SectorDataType) => [sector.properties.id, polygon(sector.geometry.coordinates, sector.properties)]))
});

export const setReferenceFixes = (referenceFixes: any[]) => ({
  type: SET_REFERENCE_FIXES,
  payload: referenceFixes
});

export const toggleSector = (id: string) => ({type: TOGGLE_SECTOR, payload: id});
export const setArtccId = (id: string) => ({type: SET_ARTCC_ID, payload: id});
export const setSectorId = (id: string) => ({type: SET_SECTOR_ID, payload: id});