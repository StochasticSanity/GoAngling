#!/usr/bin/env bash

# Define Usage
usage() {
    echo "Usage: setup.sh <domain> <subdomains> <root_redirect> <redirect_url> <rid_value>

Arguments:
<domain>                The domain to be used for the campaign as a string.
<subdomains>            A space-separated list of subdomains.
<root_redirect>         Whether or not the root domain should redirect to redirect_url. (true/false)
<redirect_url>          The URL to redirect unauthorised requests.
<rid_value>             The value for a parameter called 'rid', which defaults to 'client_id'.

Example: ./setup.sh acme.co \"test1 test2\" true example.com acme_id
"
}



# Declare output formatting functions
success() {
    printf "\033[32m%s\033[0m\n" "$1"
}
error() {
    printf "\033[31m%s\033[0m\n" "$1"
}
warning() {
    printf "\033[33m%s\033[0m\n" "$1"
}
info() {
    printf "\033[34m%s\033[0m\n" "$1"
}

function install_dependencies() {
    info "Starting the installation process..."

    # Update apt package lists
    info "Updating apt package lists..."
    apt-get update
    success "Apt package lists updated successfully."

    # Install required packages
    info "Installing required packages..."
    sudo apt-get install -y build-essential openssl wget git tmux net-tools certbot
    success "Required packages installed successfully."

}


# Check if user is root
function check_if_user_is_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    else
        success "Running as root"
    fi
}



# check for certificate
function check_and_generate_certificate() {
    if [[ -d "/etc/letsencrypt/live/$domain" ]]; then
        certificate_path="/etc/letsencrypt/live/$domain"
        success "Found certificate for $domain"
    else
        warning "Could not find certificate for $domain"
        read -p "Do you want to generate one now? [y/n] " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            warning "Please generate a certificate using the following command:"
            info "certbot certonly --manual --preferred-challenges=dns --email admin@$domain --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d '*.$domain' -d '$domain'"
            read -p "Once you have generated the certificate, press [Enter] to continue..."
            check_and_generate_certificate
        else
            error "Please generate a certificate first"
            exit
        fi
    fi
}

# Install latest version of go from source
function install_latest_go() {
    info "Fetching the latest Go version..."
    local latest_go_version=$(curl -s https://go.dev/dl/?mode=json | jq -r '.[0].version')
    
    if [ -z "$latest_go_version" ]; then
        error "Failed to fetch the latest Go version."
        return 1
    fi

    success "Latest Go version: $latest_go_version"

    info "Downloading the latest Go version..."
    local download_url="https://dl.google.com/go/${latest_go_version}.linux-amd64.tar.gz"
    curl -LO $download_url
    
    if [ $? -ne 0 ]; then
        error "Failed to download the latest Go version."
        return 1
    fi

    success "Downloaded the latest Go version."

    info "Installing the latest Go version..."
    tar -C /usr/local -xzf "${latest_go_version}.linux-amd64.tar.gz"
    ln -sf /usr/local/go/bin/go /usr/bin/go
    rm "${latest_go_version}".linux-amd64.tar.gz
    
    if [ $? -ne 0 ]; then
        error "Failed to install the latest Go version."
        return 1
    fi

    success "Installed the latest Go version."

    # Add Go binary to PATH
    export PATH=$PATH:/usr/local/go/bin
}

function replace_rid() {
    local directory="./{gophish,evilginx2}"
    local string_to_replace="client_id"
    local replacement_string="$rid"
    
    info "Replacing $string_to_replace with $replacement_string in files under $directory"
    
    find $directory -type f -exec sed -i "s|$string_to_replace|$replacement_string|g" {} \;
    
    success "Replaced $string_to_replace with $replacement_string in files under $directory"
}

function setup_gophish() {
    info "Configuring GoPhish"

    sed -i "s|\"cert_path\": \"example.crt\",|\"cert_path\": \"/etc/letsencrypt/live/$domain/fullchain.pem\",|g" config/config.json
    sed -i "s|\"key_path\": \"example.key\"|\"key_path\": \"/etc/letsencrypt/live/$domain/privkey.pem\"|g" config/config.json 

    cp config/config.json gophish/config.json
    cd gophish 
    info "Building GoPhish"
    go build -buildvcs=false || { error "Failed to build GoPhish!"; exit 1; }
    success "GoPhish has been successfully configured and built"
    cd .. 
}

function setup_evilginx() {
    # Variables
    evilginx_cfg_dir="./evilginx2/config"

    # Format subdomains as FQDNs
    formatted_subdomains=$(echo "${subdomains}" | sed "s/[^ ]* */&${domain} /g")

    # Copy over certs for phishlets
    info "Configuring evilginx"
    mkdir -p "${evilginx_cfg_dir}/crt/${domain}"
    for i in evilginx2/phishlets/*.yaml; do
        phishlet=$(echo "${i}" | awk -F "/" '{print $3}' | sed 's/.yaml//g')
        ln -sf /etc/letsencrypt/live/${domain}/fullchain.pem "${evilginx_cfg_dir}/crt/${domain}/${phishlet}.crt"
        ln -sf /etc/letsencrypt/live/${domain}/privkey.pem "${evilginx_cfg_dir}/crt/${domain}/${phishlet}.key"
    done

    # Update /etc/hosts to include the formatted subdomains
    cp /etc/hosts /etc/hosts.bak
    sed -i "s|127.0.0.1.*|127.0.0.1 localhost ${formatted_subdomains}${domain}|g" /etc/hosts

    # Update /etc/resolv.conf to use systemd-resolved
    cp /etc/resolv.conf /etc/resolv.conf.bak
    rm /etc/resolv.conf
    ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
    systemctl stop systemd-resolved

    # Build evilginx
    cd evilginx2 || { error "Failed to change directory to evilginx!"; exit 1; }
    info "Building evilginx"
    go build -buildvcs=false || { error "Failed to build evilginx!"; exit 1; }
    success "Evilginx has been successfully configured and built"
    cd ..
}

format_subdomains() {
  local formatted_subdomains=$(echo "${subdomains}" | awk -v domain="${domain}" '{ sub(/$/, "." domain); printf("%s ", $0) }' | sed "s/\.$//g")

  if [[ $(echo "${redirect}" | grep -ci "true") -gt 0 ]]; then
    echo "${formatted_subdomains}"
  else
    echo "${domain} ${formatted_subdomains}"
  fi
}

function setup_nginx() {
    info "Configuring Nginx"
    
    # Install required packages
    info "Installing required packages..."
    sudo apt-get install -y nginx-full
    success "Required packages installed successfully."

    # Set Servername
    server_name=format_subdomains

    format_subdomains() {
    local subdomains="$1"
    local domain="$2"
    echo "${subdomains}" | awk -v domain="${domain}" '{ sub(/$/, "." domain); printf("%s ", $0) }' | sed "s/\.$//g"
    }

    sed -i "s|goangling.site|${server_name};|" config/nginx/goangling.conf

    # Modify the redirect.conf file
    sed -i "s|https://example.com/|${redirect_target}|" config/nginx/goangling.conf

    # If redirect is true, add a server block for the main domain to redirect
    if [[ $(echo "${e_root_bool}" | grep -ci "true") -gt 0 ]]; then
        cat <<EOT >> config/nginx/goangling.conf

server {
    listen 443 ssl;
    server_name ${domain};

    ssl on;
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;

    location / {
        return 301 ${redirect_target};
    }
}
EOT
    fi

    update_nginx_conf
    success "Nginx has been successfully configured"
}

function update_nginx_conf() {
    info "Moving new configuration files..."
    mkdir -p /etc/nginx/includes/
    cp config/nginx/goangling.conf /etc/nginx/conf.d/
    cp config/nginx/blacklist.conf /etc/nginx/conf.d/
    cp config/nginx/redirect.conf /etc/nginx/conf.d/

    systemctl reload nginx
    success "Nginx has been successfully reloaded"
    echo -e "Please modify your nginx.conf file to include the following lines in the 'http' block:\n\nmap_hash_max_size 32768;\nmap_hash_bucket_size 128;\n"
}

# This function is mostly taken wholesale from evilgophish
function setup_apache() {
    info "Configuring Apache"

    # Install required packages
    info "Installing required packages..."
    sudo apt-get install -y apache2
    # Enable needed Apache mods
    a2enmod proxy > /dev/null 
    a2enmod proxy_http > /dev/null
    a2enmod proxy_balancer > /dev/null
    a2enmod lbmethod_byrequests > /dev/null
    a2enmod rewrite > /dev/null
    a2enmod ssl > /dev/null
    success "Required packages installed successfully."

    # Set Servername
    server_name=format_subdomains

    sed -i "s/ServerAlias goangling.site/ServerAlias ${server_name}/g" config/apache/default.conf
    sed -i "s|SSLCertificateFile|SSLCertificateFile /etc/letsencrypt/live/${domain}/cert.pem|g" config/apache/default.conf
    sed -i "s|SSLCertificateChainFile|SSLCertificateChainFile /etc/letsencrypt/live/${domain}/fullchain.pem|g" config/apache/default.conf
    sed -i "s|SSLCertificateKeyFile|SSLCertificateKeyFile /etc/letsencrypt/live/${domain}/privkey.pem|g" config/apache/default.conf


    # Don't listen on port 80
    sed -i "s|Listen 80||g" /etc/apache2/ports.conf
    # Input redirect information
    sed -i "s|https://example.com/|${redirect_url}|g" config/apache/redirect.rules

    update_apache_conf
    success "Apache has been successfully configured"
}

function update_apache_conf() {
    info "Moving new configuration files..."
    cp config/apache/default.conf /etc/apache2/sites-enabled/
    cp config/apache/blacklist.conf /etc/apache2/
    cp config/apache/redirect.rules /etc/apache2/

    systemctl reload apache2
    success "Apache has been successfully reloaded"
}



if [[ $1 == "--help" || $1 == "-h" ]]
    then
        usage
        exit 0
    fi


# Check if yq is installed, if not install it
info "Checking if yq is installed..."
if ! command -v yq >/dev/null 2>&1 ; then
    info "yq not found. Proceeding with installation..."
    wget https://github.com/mikefarah/yq/releases/download/3.4.1/yq_linux_amd64 -O /usr/bin/yq
    chmod +x /usr/bin/yq
    success "yq installed successfully."
fi

# check if conf.yaml exists
if [ -f "conf.yaml" ]
then
# read in values from file
domain=$(yq r conf.yaml domain)
subdomains=$(yq r conf.yaml subdomains)
redirect=$(yq r conf.yaml redirect)
redirect_target=$(yq r conf.yaml redirect_target)
rid=$(yq r conf.yaml rid)
else
# check if all command line arguments are present
if [ "$#" -ne 5 ]
then
    echo help_message
    exit
fi

# set variables from command line arguments
domain=$1
subdomains=$2
redirect=$3
redirect_target=$4
rid=$5
fi


function main () {
    # Notify the user that the installation is starting
    info "Starting GoAngler installation..."
    
    check_if_user_is_root
    install_dependencies
    install_latest_go
    check_and_generate_certificate
    replace_rid
    # setup_nginx 
    setup_apache
    setup_evilginx
    setup_gophish

    # Notify the user that the installation has finished
    success "GoAngler installation complete!"
}
main 