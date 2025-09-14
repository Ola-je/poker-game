import random
from typing import List

RANKS = "23456789TJQKA"
SUITS = "cdhs"

def make_deck():
    return [r+s for r in RANKS for s in SUITS]

def shuffle_deck(seed: int | None = None):
    deck = make_deck()
    if seed is not None:
        random.Random(seed).shuffle(deck)
    else:
        random.shuffle(deck)
    return deck

def deal_hole_cards(deck: List[str], num_players: int):
    hole = []
    idx = 0
    for _ in range(num_players):
        c1, c2 = deck[idx], deck[idx+1]
        idx += 2
        hole.append([c1, c2])
    return hole, deck[idx:]
