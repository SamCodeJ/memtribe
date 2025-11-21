#!/bin/bash
# Check FFmpeg file headers

echo "================================"
echo "Checking Headers for FFmpeg Files"
echo "================================"
echo ""

echo "1. Main page headers:"
curl -I https://memtribe.com 2>/dev/null | grep -i "cross-origin"
echo ""

echo "2. FFmpeg JS file headers:"
curl -I https://memtribe.com/ffmpeg-core/ffmpeg-core.js 2>/dev/null | grep -i "cross-origin"
echo ""

echo "3. All headers for FFmpeg JS file:"
curl -I https://memtribe.com/ffmpeg-core/ffmpeg-core.js 2>/dev/null
echo ""

echo "================================"
echo "If you see NO 'Cross-Origin' headers above,"
echo "then the Nginx config hasn't been updated yet."
echo "================================"

