import axios from "axios";

const polybiusURL = process.env.REACT_APP_POLYBIUS_URL;

const socketUrl = `${polybiusURL}/Bridj`;
const baseURL = `${polybiusURL}/v1/Bridj`;

const api = axios.create({ baseURL });

export { api, socketUrl };
