from gensim.summarization import keywords
import requests
import datetime
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
from pymongo import MongoClient
import traceback

from rake_nltk import Rake
import json
import sys


# body crwall
def crwallbody(href):
    req = requests.get(href
                       , headers={'User-Agent': 'Mozilla/5.0'})
    req.encoding = 'utf-8'
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.select('p', class_='Paragraph-paragraph-2Bgue ArticleBody-para-TD_9x')
    a = []
    # print(posts)
    paragraphs = []
    for i in posts:
        a.append(i.text.strip())
    return (''.join(a))


def eng2kr(query):
    url = 'https://kapi.kakao.com/v1/translation/translate'
    headers = {"Authorization": "KakaoAK 9a9b949ea999ae1de50dc689f80bd8c4"}
    # headers = {"Authorization" =  "KakaoAK[252e6227aaafb3418140ca0e7c4154ab]" }
    data = {
        "src_lang": "en",
        "target_lang": "kr",
        "query": query
    }
    response = requests.post(url, headers=headers, data=data)
    print(type(response.json()['translated_text']))
    results = ''.join((map(str, response.json()['translated_text'])))
    return (results.replace('[','').replace(']',''))


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
    plain_text = []
    r = Rake()
    href = []
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    posts = soup.select('.story-content a ')
    for i in posts:
        if 'href' in i.attrs:
            plain_title = i.get_text().replace("\t", "").replace("\n", "")
            plain_href = 'https://www.reuters.com/news/world' + str(i.attrs['href'])
            plain_text_temp = crwallbody(plain_href)
            plain_text = plain_text.append(plain_text_temp)
            # summary
            r.extract_keywords_from_text(plain_text_temp)
            summary_temp = ','.join(r.get_ranked_phrases()[:3])
            summary.append(summary_temp)
            summary_kor.append(''.join(eng2kr(summary_temp)))
            # keyword
            keyword_temp = ','.join(keywords(plain_text_temp).split('\n')[:3])
            keyword.append(keyword_temp.replace('reuters','').replace('news','').replace('provider',''))
            keyword_kor.append(''.join(eng2kr(keyword_temp)))
            href.append(plain_href)
            title.append(plain_title)
            title_kor.append(''.join(eng2kr(i.get_text())))
            upload_day.append(datetime.datetime.utcnow())

    latest = pd.DataFrame({'href': href, 'title': title, 'title_kor' : title_kor , 'summary': summary, 'keyword': keyword , 'keyword_kor' :  keyword_kor , 'summary_kor' : summary_kor  , 'upload_day' : upload_day , 'plain_text' : plain_text})
    latest = latest.fillna(0)
    latest = latest[latest['title'].isin(findMongo()) == False]
    print(latest)
    latest.reset_index(inplace=True)
    data_dict = latest.to_dict("records")
    print(data_dict)
    return data_dict


def insert2MongoArticle(latest):
    try:
        client = MongoClient('mongodb://dong:dong123@localhost:27017')
        db = client['article_service']
        col = db['Article']
        col.insert_many(latest)
    except Exception as e:
        print(traceback.format_exc())
        print('insert error')


def insert2MongoBody(article):
    try:
        client = MongoClient('mongodb://dong:dong123@localhost:27017')
        db = client['article_service']
        col = db['Article_body']
        col.insert_many(latest)
    except Exception as e:
        print(traceback.format_exc())
        print('insert error')

def findMongo():
    results = dict()
    try:
        client = MongoClient('mongodb://dong:dong123@localhost:27017')
        db = client['article_service']
        col = db['Article']
        results = col.distinct('title')

        return results
    except Exception as e:
        print(traceback.format_exc())
        print('find error')


latest = crwallNews()
print(latest)
print(type(latest))
# not null insert
if latest:
    insert2MongoArticle(latest)