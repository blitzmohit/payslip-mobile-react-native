import {
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  CLEAR_AUTH_ERROR,
} from './actionTypes';
import axios from 'axios';
import {API_URL, API_JSON_HEADER} from '../../../appSetting';
import setAuthToken from '../../../setAuthToken';
import {AsyncStorage} from 'react-native';
import {goToLogin, startApp} from '../../navigations';

export const login = authData => async dispatch => {
  const url = API_URL + 'auth';

  try {
    const res = await axios.post(url, authData, API_JSON_HEADER);

    if (res.status === 200) {
      const token = res.data.token;
      //set auth token
      setAuthToken(token);

      //set async storage
      await AsyncStorage.setItem('TOKEN', token);

      //go home
      startApp();

      //load user session
      const user = await getUser();

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {token, user},
      });
    } else {
      dispatch({
        type: LOGIN_FAIL,
        payload: {
          message: res.data.message,
        },
      });
    }
  } catch (error) {
    console.log(error);

    dispatch({
      type: LOGIN_FAIL,
      payload: {
        message: 'Invalid Credentials',
      },
    });
  }
};

export const logout = () => async dispatch => {
  setAuthToken();
  await AsyncStorage.removeItem('TOKEN');
  goToLogin();
  dispatch({
    type: LOGOUT,
  });
};

export const clearAuthError = () => {
  return {
    type: CLEAR_AUTH_ERROR,
  };
};

const getUser = async () => {
  const url = API_URL + 'auth';
  const res = await axios.get(url);
  const user = res.data.data[0];

  return user;
};
