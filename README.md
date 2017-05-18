# Calculate similarity between use case and code based on synonyms


# Installing

## Dependencies

    npm install
    git clone https://github.com/useion/useion.git
    cd useion
    npm install

## NLTK

Install NLTK in your system. For Gentoo, type:

    emerge dev-python/nltk 

Download dictionary, tokenizer, and POS tagger:

    python
    import nltk;
    nltk.donwload();

Select:

* wordnet
* models/punkt
* models/maxent_treebank_pos_tagger

# Running

To calculate the similarity, it is required to run the following scripts:

1. `init.js` to initialize database
2. `preprocess.js` to find synonyms from the use cases (it is required to run `python lib/usecaseprocess/NltkInterface.py` prior to running this script)
3. `calc.js` to calculate the similarity

Here are examples how to run them:

    node init.js
    python lib/usecaseprocess/NltkInterface.py &
    node preprocess.js --uc-path UC_PATH
    node calc.js --code-path CODE_PATH --lang LANG

The legend:

| UC_PATH   | path to the use cases      |
| CODE_PATH | path to the implementation | 
| LANG      | programming language, e.g. php       |

# Authors

* Michal Krempasky - code
* Michal Bystricky - readme, refactoring, fixing the algorithm


