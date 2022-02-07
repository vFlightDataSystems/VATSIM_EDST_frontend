import {
  ADD_ACL_CID,
  ADD_DEP_CID,
  DELETE_ACL_CID,
  DELETE_DEP_CID,
  SET_ACL_CID_LIST, SET_ACL_MANUAL_POSTING,
  SET_ACL_SORT,
  SET_DEP_CID_LIST, SET_DEP_MANUAL_POSTING, SET_DEP_SORT
} from './actionTypes';

export const addAclCid = (cid: string) => ({
  type: ADD_ACL_CID,
  payload: {cid: cid}
});

export const deleteAclCid = (cid: string) => ({
  type: DELETE_ACL_CID,
  payload: {cid: cid}
});

export const setAclCidList = (cid_list: string[], deleted_list: string[]) => ({
  type: SET_ACL_CID_LIST,
  payload: {cid_list: cid_list, deleted_list: deleted_list}
});

export const addDepCid = (cid: string) => ({
  type: ADD_DEP_CID,
  payload: {cid: cid}
});

export const deleteDepCid = (cid: string) => ({
  type: DELETE_DEP_CID,
  payload: {cid: cid}
});

export const setDepCidList = (cid_list: string[], deleted_list: string[]) => ({
  type: SET_DEP_CID_LIST,
  payload: { cid_list: cid_list, deleted_list: deleted_list }
});

export const setAclSort = (name: string, sector: boolean) => ({type: SET_ACL_SORT, payload: {name: name, sector: sector}});
export const setDepSort = (name: string) => ({type: SET_DEP_SORT, payload: {name: name, sector: false}});
export const setAclPosting = (value: boolean) => ({type: SET_ACL_MANUAL_POSTING, payload: {manual_posting: value}});
export const setDepPosting = (value: boolean) => ({type: SET_DEP_MANUAL_POSTING, payload: {manual_posting: value}});