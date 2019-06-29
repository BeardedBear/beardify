module Data.Search exposing (Model, init)

import Data.Album exposing (Album)
import Data.Artist exposing (Artist)
import Data.Track exposing (Track)


type alias Model =
    { findArtist : List Artist
    , findAlbum : List Album
    , findTrack : List Track
    , searchQuery : String
    }


init : Model
init =
    { findArtist = []
    , findAlbum = []
    , findTrack = []
    , searchQuery = ""
    }
