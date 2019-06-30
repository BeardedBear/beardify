module Data.Search exposing (Model, searchInit)

import Data.Album exposing (Album)
import Data.Artist exposing (Artist)
import Data.Track exposing (Track)


type alias Model =
    { findArtist : List Artist
    , findAlbum : List Album
    , findTrack : List Track
    , searchQuery : String
    }


searchInit : Model
searchInit =
    { findArtist = []
    , findAlbum = []
    , findTrack = []
    , searchQuery = ""
    }
