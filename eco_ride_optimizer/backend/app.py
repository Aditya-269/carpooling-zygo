from flask import Flask, request, jsonify
from optimizer import get_route_with_etas
from flask_cors import CORS

import mock_data

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"], supports_credentials=True)


@app.route('/optimize-route', methods=['POST'])
def optimize():
    data = request.get_json()
    locations = data.get("locations", mock_data.sample_locations)
    start = data.get("start", mock_data.start_point)
    pairs = data.get("pairs", mock_data.pairs)
    
    optimized_route, etas = get_route_with_etas(start, locations, pairs)
    return jsonify({
        "optimized_route": optimized_route,
        "segments": etas
    })

if __name__ == '__main__':
    app.run(debug=True)
