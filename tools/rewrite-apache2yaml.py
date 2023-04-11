"""
Script to convert Apache rewrite rules into YAML format

Author: Joseph Erdosy

Usage:
    ./apache2yaml.py rewrites.conf 

Input:
    The input file is specified as a command-line argument and should be an Apache configuration file containing `RewriteCond` lines with `HTTP_USER_AGENT` and `REMOTE_HOST` matches.

Output:
    The output file is specified by the `output_file` variable and will be a YAML file containing the parsed data, with the `user_agents` and `remote_hosts` lists sorted alphabetically.

Notes:
    - The script assumes that the input file contains `RewriteCond` lines with `HTTP_USER_AGENT` and `REMOTE_HOST` matches.
    - The parsed data is stored in a dictionary with keys `user_agents` and `remote_hosts`.
    - The script uses the `re` and `yaml` modules, which should be installed.
    - The script uses the `default_flow_style=False` option when writing the YAML file.

References:
    - Python Regular Expression HOWTO: https://docs.python.org/3/howto/regex.html
    - PyYAML documentation: https://pyyaml.org/wiki/PyYAMLDocumentation
"""

import re
import yaml
import sys

# Define input and output files
input_file = sys.argv[1]  # The input file is a command line argument
output_file = "./redirect.yaml"

# Read the Apache configuration file
with open(input_file, "r") as f:
    lines = f.readlines()

# Prepare the data structure
config = {
    "user_agents": [],  # An empty list to store user agents
    "remote_hosts": []  # An empty list to store remote hosts
}

# Parse the Apache configuration file
for line in lines:
    user_agent_match = re.match(r'^RewriteCond %{HTTP_USER_AGENT} \^.\*(.*?)\.\*\$', line)  # Match user agents
    remote_host_match = re.match(r'^RewriteCond %{REMOTE_HOST} \^(.*?)\$\s*\[OR,NC\]', line)  # Match remote hosts

    # If a user agent match is found, add it to the config dictionary
    if user_agent_match:
        config["user_agents"].append(user_agent_match.group(1))
    
    # If a remote host match is found, add it to the config dictionary
    elif remote_host_match:
        config["remote_hosts"].append(remote_host_match.group(1))

# Sort user_agents and remote_hosts lists
config["user_agents"] = sorted(config["user_agents"])  # Sort the list of user agents alphabetically
config["remote_hosts"] = sorted(config["remote_hosts"])  # Sort the list of remote hosts alphabetically

# Write the configuration to a YAML file
with open(output_file, "w") as f:
    yaml.dump(config, f, default_flow_style=False)  # Write the YAML data to the output file, with default_flow_style set to False