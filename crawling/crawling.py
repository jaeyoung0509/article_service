from gensim.summarization import keywords
import requests
import datetime
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
from pymongo import MongoClient
import traceback
def eng2kr(query):
    url = 'https://kapi.kakao.com/v1/translation/translate'
    headers = {"Authorization": "KakaoAK 252e6227aaafb3418140ca0e7c4154ab"}
    # headers = {"Authorization" =  "KakaoAK[252e6227aaafb3418140ca0e7c4154ab]" }
    data = {
        "src_lang": "en",
        "target_lang": "kr",
        "query": query
    }
    response = requests.post(url, headers=headers, data=data)
    print(type(response.json()['translated_text']))
    return (''.join((map(str , response.json()['translated_text']))))

def crwallNews():
    req = requests.get('https://www.reuters.com/news/world')
    req.encoding = 'utf-8'
    title = []
    title_kor = []
    keyword = []
    keyword_kor = []
    summary = []
    summary_kor = []
    upload_day = []
    href = []
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.select('.story-content a ')
    for i in posts:
        if 'href' in i.attrs:
                plain_title = i.get_text().replace("\t", "").replace("\n", "")
                plain_href = 'https://www.reuters.com/news/world' + str(i.attrs['href'])
                '''
                용범이가 여기다  저 href 주소 들어가서 크롤링해서  원문 가져온다음에 rake 이용해서 3줄 요약하면댐
                '''



                '''
                   keyword.append(''.join(keywords(plain_title).split('\n')))
                '''
                href.append(plain_href)
                title.append(plain_title)
                title_kor.append(''.join(eng2kr(i.get_text())))
                upload_day.append(datetime.datetime.utcnow())


    latest = pd.DataFrame({"href": href, "title": title, "title_kor": title_kor , "upload_day" : upload_day})
    latest = latest.fillna(0)
    latest=latest[latest['title'].isin(findMongo()) == False]
    print(latest)
    latest.reset_index(inplace=True)
    data_dict = latest.to_dict("records")
    print(data_dict)
    return data_dict
def insert2Mongo(latest):
    try:
        client = MongoClient('mongodb://dong:dong123@localhost:27017')
        db = client['article_service']
        col =db['Article']
        col.insert_many(latest)
    except Exception as e:
        print(traceback.format_exc())
        print('insert error')


def findMongo():
    results = dict()
    try:
        client = MongoClient('mongodb://dong:dong123@localhost:27017')
        db = client['article_service']
        col =db['Article']
        results= col.distinct('title')
        return results
    except Exception as e:
        print(traceback.format_exc())
        print('find error')

print(findMongo())
latest = crwallNews()
#널 값이 아닐 경우만 insert
if  latest:
    insert2Mongo(latest)

