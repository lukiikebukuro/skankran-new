#!/usr/bin/env python3
"""
Clean removal of hardcoded waterStations data from waterAnalysis.js
Removes lines 40-5373 (the entire hardcoded object content)
Keeps: export const waterStations = {}; (line 37)
"""

input_file = r'c:\Users\lpisk\Projects\skankran2\static\js\waterAnalysis.js'
output_file = r'c:\Users\lpisk\Projects\skankran2\static\js\waterAnalysis_clean.js'

print("🔧 Reading waterAnalysis.js...")
with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"📊 Total lines: {len(lines)}")
print(f"📌 Line 37: {lines[36].strip()}")
print(f"📌 Line 40: {lines[39][:50].strip()}...")
print(f"📌 Line 5373: {lines[5372].strip()}")

# Keep lines 1-39, skip 40-5373, keep 5374+
clean_lines = lines[:39] + lines[5373:]

print(f"\n✂️ Removing lines 40-5373 ({5373-39} lines)")
print(f"📊 New total: {len(clean_lines)} lines")

# Write clean version
with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print(f"\n✅ Clean file written to: {output_file}")
print("\n🔄 Next steps:")
print("1. Review waterAnalysis_clean.js")
print("2. If OK, replace original: move waterAnalysis_clean.js to waterAnalysis.js")
print("3. Restart Flask server")
