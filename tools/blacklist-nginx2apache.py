"""
Script to convert Nginx blacklist rules into Apache format

Author: Joseph Erdosy

Usage:
    python blacklist-nginx2apache.py output_file.conf

Input:
    The input file is specified by the `input_file` variable and should be an Nginx configuration file named "blacklist.conf".

Output:
    The output file is specified by the command line argument `output_file` and will be an Nginx configuration file containing `deny` statements that deny access to the specified IP ranges.

Notes:
    - The script assumes that the input file contains `deny` lines with IP ranges to block.
    - The script uses the `re` module, which should be installed.
    - The script generates `Require not ip` statements that deny access to the specified IP ranges in Apache syntax.

References:
    - Nginx `deny` directive: https://nginx.org/en/docs/http/ngx_http_access_module.html#deny
    - Python Regular Expression HOWTO: https://docs.python.org/3/howto/regex.html
    - Apache access control: https://httpd.apache.org/docs/2.4/howto/access.html
"""

import re
import sys

# Define input and output files
input_file = "blacklist.conf"
output_file = sys.argv[1]  # The input file is a command line argument

# Read the Apache blacklist file
with open(input_file, "r") as f:
    lines = f.readlines()

# Prepare the Nginx rules
apache_rules = []

# Convert Apache rules to Nginx syntax
for line in lines:
    if line.startswith("deny"):
        ip_range = re.search(r'(?<=ip\s)(.*)', line).group(1)
        apache_rules.append(f"Require not ip {ip_range};")

# Write the Nginx rules to the output file
with open(output_file, "w") as f:
    f.write("\n".join(apache_rules))