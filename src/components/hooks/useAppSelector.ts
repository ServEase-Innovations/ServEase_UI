/* eslint-disable */
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/userStore';

export const useAppSelector = useSelector<RootState>;