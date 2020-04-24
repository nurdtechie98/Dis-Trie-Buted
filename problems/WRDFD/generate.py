import random
def generate_big_random_sentences(filename,linecount):
    nouns = ("puppy", "car", "rabbit", "girl", "monkey")
    verbs = ("runs", "hits", "jumps", "drives", "barfs")
    adv = ("crazily.", "dutifully.", "foolishly.", "merrily.", "occasionally.")
    adj = ("adorable", "clueless", "dirty", "odd", "stupid")

    all = [nouns, verbs, adj, adv]

    with open(filename,'a+') as f:
        for i in range(linecount):
            f.writelines([' '.join([random.choice(i) for i in all]),'\n'])
    pass

generate_big_random_sentences("words.txt",9999999)