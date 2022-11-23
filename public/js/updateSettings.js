import axios from 'axios';
import { showAlert } from './alerts';
export const updateSetting = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'Success')
      showAlert('success', `${type.toUpperCase()} updated successfully`);
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
