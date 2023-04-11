"""
Takes in a hard-coded YAML file with two keys "user_agents" and "remote_hosts" and generates an nginx redirect file using map statements.

Author: Joseph Erdosy

Usage:
    python generate_nginx_redirects_map.py <output_file>

Input:
    The script reads a hard-coded YAML file containing two keys: `user_agents` and `remote_hosts`. These keys should contain lists of strings, which represent the user agents and remote hosts to be redirected.

Output:
    The output file will be an nginx configuration file containing map statements and if statements to redirect users based on their user agent or remote host.

Examples:
    $ python generate_nginx_redirects_map.py output.conf
    The nginx redirect file has been generated at output.conf.

Notes:
    - The script assumes that the REDIR_TARGET variable has been defined in the nginx configuration file.
    - The script uses the `yaml` module, which should be installed.
    - The script generates map statements and if statements that redirect users based on their user agent or remote host.

References:
    - Nginx `map` directive: https://nginx.org/en/docs/http/ngx_http_map_module.html#map
    - Nginx `if` directive: https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#if
    - PyYAML documentation: https://pyyaml.org/wiki/PyYAMLDocumentation
"""

import sys
import yaml

# Set the input file and get the output file from the command line arguments
input_file = "./redirect.yaml"
output_file = sys.argv[1]

# Load the data from the input file
with open(input_file, "r") as f:
    content = yaml.safe_load(f)

# Get the lists of user agents and remote hosts
user_agents = content["user_agents"]
remote_hosts = content["remote_hosts"]

# Define the initial part of the nginx configuration file
nginx_config = "# Define REDIR_TARGET\n"
nginx_config += "set $redir_target \"https://example.com/\";\n\n"

# Convert User Agents to nginx `map` statements
nginx_config += "map $http_user_agent $redirect_user_agent {\n"
nginx_config += "    default 0;\n"
for ua in user_agents:
    nginx_config += f"    \"~*{ua}\" 1;\n"
nginx_config += "}\n\n"

# Convert Remote Hosts to nginx `map` statements
nginx_config += "map $remote_addr $redirect_remote_host {\n"
nginx_config += "    default 0;\n"
for rh in remote_hosts:
    nginx_config += f"    \"~*{rh}\" 1;\n"
nginx_config += "}\n\n"

# Add the location block to the nginx configuration
nginx_config += "location / {\n"

# Add `if` statements using the generated maps
nginx_config += "    if ($redirect_user_agent) { return 302 $redir_target; }\n"
nginx_config += "    if ($redirect_remote_host) { return 302 $redir_target; }\n"

nginx_config += "}\n"

# Write the nginx configuration to the output file
with open(output_file, "w") as f:
    f.write(nginx_config)