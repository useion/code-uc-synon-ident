import nltk as nl
from nltk.corpus import wordnet as wn
from nltk.stem.wordnet import WordNetLemmatizer
from pattern3.text.en import singularize
from xmlrpc.server import SimpleXMLRPCServer as xs
from xmlrpc.server import SimpleXMLRPCRequestHandler as rh
import re

def pos_assign(sentence):
    sentence = re.sub(r'[^a-zA-Z0-9\s]+', '', sentence)
    print("called" + sentence)
    tokenizedtext = nl.word_tokenize(sentence)
    print(tokenizedtext)
    posTagged = nl.pos_tag(tokenizedtext)
    # print(posTagged)
    return posTagged


def simwords_find(worditself, type):
    print("porcessing ",worditself, type)
    word = worditself
    try:
        word = WordNetLemmatizer().lemmatize(worditself,type)
    except Exception:
        word = worditself
    
    if (type == "n"): 
        word = singularize(word)
    
    print("lemma + singular if noun", word)
    synseting = wn.synsets(word) #itself)
    # print(synseting)
    syn = []
    hype = []
    hypo = []
    for s in synseting:
        # print(s.pos())
        if s.pos() == type:
            # print(s.lemma_names())
            if s.lemma_names() in syn:
                pass
            else:
                syn.extend(s.lemma_names())
        for h in s.hypernyms():
            if h.pos() == type:
                if h.lemma_names() in hype:
                    pass
                else:
                    hype.extend(h.lemma_names())
                    # print(h.lemma_names())

        for h in s.hyponyms():
            if h.pos() == type:
                if h.lemma_names() in hypo:
                    pass
                else:
                    hypo.extend(h.lemma_names())
                    # print(h.lemma_names())
    print("Output ", word, syn, hype, hypo)
    return word, syn, hype, hypo


class RequestHandler(rh):
    rpc_paths = ('/')


server = xs(("localhost", 9000), requestHandler=RequestHandler)

server.register_introspection_functions()
server.register_function(pos_assign, 'postag')
server.register_function(simwords_find, 'sim')

try:
    print('Use Control-C to exit')
    server.serve_forever()
except KeyboardInterrupt:
    print('Exiting')
