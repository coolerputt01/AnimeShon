#include<iostream>
#include<sys/socket.h>
#include<netinet/in.h>
#include<unistd.h>
#include<cstring>
#include<curl/curl.h>
#include<map>
#include<sstream>
#include<vector>
using namespace std;

const string animeApiUrl = "https://api.jikan.moe/v4/anime/";
const string animerandomAPIurl = "https://api.jikan.moe/v4/random/anime";
const string animeSearchAPIurl = "https://api.jikan.moe/v4/anime?q=";
const string animeSearchPagePaginationAPIurl = "&page=";
const string animeSearchLimitPaginationAPIurl = "&limit=10";
std::string response;
std::string corsHeaders = "Access-Control-Allow-Origin: *\r\n"
"Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
"Access-Control-Allow-Headers: Content-Type\r\n";

size_t chunkDataAssignment(void* contents, size_t byte, size_t numElem,std::string* output){
  size_t totalBytes = byte * numElem;
  output->append((char*)contents,totalBytes);
  
  return totalBytes;
}

void fetchAnimeData(string apiUrl){
  response.clear();
  CURL* curl;
  CURLcode res;
  curl = curl_easy_init();
  
  if(curl) {
    curl_easy_setopt(curl,CURLOPT_URL,apiUrl.c_str());
    curl_easy_setopt(curl,CURLOPT_WRITEFUNCTION,chunkDataAssignment);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA,&response);
    curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT,10L);
    
    res = curl_easy_perform(curl);
    
    if(res != CURLE_OK){
      cerr<<"Failed to form a valid resquest on curl: '"<<curl_easy_strerror(res)<<"'\n";
    }else {
      response = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n"+ corsHeaders+ "\r\n" + response;
    }
    curl_easy_cleanup(curl);
  }else {
    cerr<<"Failed to setup Curl.\n";
  }
}

int setUpServer(int &sockets) {
  if(sockets == -1){
    cerr<<"Failed to setup sockets\n";
    return 1;
    }
  
  sockaddr_in address;
  address.sin_family = AF_INET;
  address.sin_addr.s_addr = INADDR_ANY;
  address.sin_port = htons(8080);
  
  if(::bind(sockets,(struct sockaddr*)&address,sizeof(address)) < 0){
    cerr<<"Failed to bind at address on PORT: 8080\n";
    return 1;
  }
  if(listen(sockets,3) < 0){
    cerr<<"Failed to listen at address on PORT: 8080\n";
    return 1;
  }
  cout<<"Server running on PORT: 8080......\n";
  return 0;
}

map<string, string> parseQuery(string &requestParamStr){
  map<string, string> param;
  stringstream ss(requestParamStr);
  string pair;
  while(getline(ss,pair,'&')){
    auto equator = pair.find('=');
    if(equator != string::npos){
      param[pair.substr(0,equator)] = pair.substr(equator + 1);
    }
  }
  return param;
}vector<string> parseStreamUrl(string &url) {
    vector<string> parts;
    string part;
    stringstream ss(url);
  
    while (getline(ss, part, '/')) {
        if (!part.empty()) {
            string token;
            stringstream wordStream(part);

            // Split by space as well
            while (wordStream >> token) {
                // Handle "HTTP/1.1" separately
                if (token.find("HTTP") != string::npos) {
                    parts.push_back("HTTP");
                    parts.push_back("1.1");
                } else {
                    parts.push_back(token);
                }
            }
        }
    }
    return parts;
}


void handleRequest(int &sockets,string apiUrl){
  while(true){
    int client = accept(sockets,nullptr,nullptr);
    if(client < 0){
      cerr<<"RequestHandler failed to setup...\n";
      continue;
    }
    
    char buffer[4096] = {0};
    ssize_t request_data = read(client,buffer,sizeof(buffer));
    if(request_data < 0){
      close(client);
      continue;
    }
    
    string request(buffer);
    if(request.find("GET /anime") != string::npos && request.find("/episodes/") != string::npos){
    string animeUrl = request;
    vector<string> animeIdParts = parseStreamUrl(animeUrl);
    string newApiUrl = animeApiUrl + animeIdParts[2] + "/episodes/" + animeIdParts[4];
    for(auto &t : animeIdParts){
        cout<<t<<endl;
    }
    fetchAnimeData(newApiUrl);
    }else if(request.find("GET /anime") != string::npos && request.find("/episodes") != string::npos){
          string animeUrl = request;
          vector<string> animeIdParts = parseStreamUrl(animeUrl);
          string newApiUrl = animeApiUrl + animeIdParts[2] + "/episodes";
          fetchAnimeData(newApiUrl);
    }else if(request.find("GET /anime/") == 0){
          string animeUrl = request;
          vector<string> idParts = parseStreamUrl(animeUrl);
          for(auto &t : idParts){
            cout<<t<<endl;
          }
          auto animeId = idParts[2];
          string newApiUrl = animeApiUrl + animeId;
          fetchAnimeData(newApiUrl);
        }else if(request.find("GET /anime") == 0){
      cout<<"lollllll\n";
      fetchAnimeData(apiUrl);
        }else if(request.find("GET /random-anime") != string::npos){
          fetchAnimeData(animerandomAPIurl);
        }else if(request.find("GET /") != string::npos && request.find("/streaming") != string::npos) {
          string streamingApiUrl = request;
          vector<string> animeIdParts = parseStreamUrl(streamingApiUrl);
          for(auto &t : animeIdParts){
            cout<<t<<endl;
          }
          auto animeId = animeIdParts[1];
          string newApiUrl = animeApiUrl + animeId + "/streaming";
          fetchAnimeData(newApiUrl);
        }else if(request.find("GET /search") != string::npos){
          
          size_t requestPath = request.find("GET /search");
          size_t requestQueryStart = request.find('?',requestPath);
          if(requestQueryStart == string::npos){
            cerr<<"No query params found.\n";
            continue;
          }
          size_t requestQueryEnd = request.find(" ",requestQueryStart);
          
          std::string queryParamsStr = request.substr(requestQueryStart + 1,requestQueryEnd - requestQueryStart- 1);
          
          auto params = parseQuery(queryParamsStr);
          string apiUrl = animeSearchAPIurl + params["q"] + animeSearchPagePaginationAPIurl + params["page"] + animeSearchLimitPaginationAPIurl;
          fetchAnimeData(apiUrl);
        }else if(request.find("GET /") != string::npos){
          response = "HTTP/1.1 200 OK\r\n"
               "Content-Type: text/html\r\n"
               "Connection: close\r\n\r\n"
               "<h1>Hey there</h1>\n";
        }else {
            response = "HTTP/1.1 404 Not Found\r\n"
                       "Content-Type: text/plain\r\n"
                       "Connection: close\r\n\r\n"
                       "Endpoint not found!\n";
        }
        
        send(client,response.c_str(),response.size(),0);
        close(client);
    }
  }

int main() {
  
  curl_global_init(CURL_GLOBAL_DEFAULT);
  
  int sockets = socket(AF_INET,SOCK_STREAM,0);
  int server = setUpServer(sockets);
  if(server == 0){
    cout<<"Server successfully setup...\n";
  }
  handleRequest(sockets,animeApiUrl);
  curl_global_cleanup();
  close(sockets);
}