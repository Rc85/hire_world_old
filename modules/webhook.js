const app = require('express').Router();
const db = require('./db');
const stripe = require('stripe')(STRIPE_TEST_KEY);