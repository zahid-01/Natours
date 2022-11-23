import '@babel/polyfill';
import { displayMap } from './mapBox';
import { login } from './login';
import { logout } from './login';
import { updateSetting, changePassword } from './updateSettings';
import { bookTheTour } from './stripe';

const loginForm = document.querySelector('.form--login');
const mapBox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateSettings = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-settings');
const bookTour = document.getElementById('book-tour');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateSettings) {
  updateSettings.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSetting(form, 'settings');
  });
}

if (updatePassword) {
  updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password-current').value;
    const updatePassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    await updateSetting({ password, updatePassword, confirmPassword }, 'password');
    document.getElementById('password-current').textContent = '';
    document.getElementById('password').textContent = '';
    document.getElementById('password-confirm').textContent = '';
  });
}

if (bookTour) {
  bookTour.addEventListener('click', (e) => {
    const tourId = bookTour.dataset.tourid;
    bookTheTour(tourId);
  });
}
