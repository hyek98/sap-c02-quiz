#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 SAP-C02 모의고사 서버 시작..."
echo ""
echo "📱 접속 주소:"
echo "   PC: http://localhost:8000"
echo ""
echo "   핸드폰/다른 PC (같은 WiFi):"
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "   http://" $2 ":8000"}'
echo ""
echo "💡 종료: Ctrl+C"
echo ""
python3 -m http.server 8000