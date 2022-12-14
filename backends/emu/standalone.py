#!/usr/bin/env python
# encoding: utf-8

import sys
# import urllib.request
import requests
import json, os
from jsonpath_ng import jsonpath, parse

from time import time, sleep

from pysondb import PysonDB
db_ticket = PysonDB('ticket.json')
db_events = PysonDB('events.json')

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app, resources={r"/ticket": {"origins": "http://localhost:19006"}})
cors = CORS(app, resources={r"/events": {"origins": "http://localhost:19006"}})

cors = CORS(app, resources={r"/ticket": {"origins": "http://10.42.0.87:19006"}})
cors = CORS(app, resources={r"/events": {"origins": "http://10.42.0.87:19006"}})

cors = CORS(app, resources={r"/ticket": {"origins": "https://tezket-test.web.app"}})
cors = CORS(app, resources={r"/events": {"origins": "https://tezket-test.web.app"}})

# export type EventInfo = {
#   name: string;
#   urlimg: String;
#   tag: string;
#   keyword: string;
#   description: string;
#   timepref: string;
#   contract: string;
#   // ------------------ [M]
#   ticketype: string;  
#   ticketsize: string;  
#   ticketprice: string;
#   priceunit: string;
#   // tickename: string;  
#   // ------------------
# }

# export type TicketState = {
#   name: string;
#   urlimg: String;
# }

@app.route('/ticket')
def get_ticket():
  return jsonify(db_ticket.get_all())

@app.route('/ticket', methods=['POST'])
def add_ticket():
  db_ticket.add(request.get_json())
  return '', 200

@app.route('/ticket/<ticketId>', methods=['PATCH'])
def patch_ticket(ticketId):
  db_ticket.update_by_query(
    query=lambda x: x['ticketId'] == ticketId,
    new_data=request.get_json()
  )
  return '', 200

@app.route('/events/<ref>')
def get_events_by_ref(ref):
  return jsonify(db_events.get_by_id(ref))

@app.route('/events')
def get_events():
  return jsonify(db_events.get_all())

@app.route('/events', methods=['POST'])
def add_events():
  db_events.add(request.get_json())
  return '', 200



# app.run()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
