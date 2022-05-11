import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useRootDispatch = () => useDispatch<AppDispatch>();
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector;