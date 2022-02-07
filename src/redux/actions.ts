import {ADD_ACL_CID, ADD_DEP_CID, DELETE_ACL_CID, DELETE_DEP_CID, SET_ACL_CID_LIST, SET_DEP_CID_LIST} from './actionTypes';

export const addAclCid = (cid: string) => ({
  type: ADD_ACL_CID,
  payload: {cid: cid}
});

export const deleteAclCid = (cid: string) => ({
  type: DELETE_ACL_CID,
  payload: {cid: cid}
});

export const setAclCidList = (cid_list: Array<string>, deleted_list: Array<string>) => ({
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

export const setDepCidList = (cid_list: Array<string>, deleted_list: Array<string>) => ({
  type: SET_DEP_CID_LIST,
  payload: { cid_list: cid_list, deleted_list: deleted_list }
});
