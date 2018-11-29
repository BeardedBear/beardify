module Data.Search exposing (Model, init)

import Data.Album
import Data.Artist
import Data.Track
import Http exposing (..)
import Json.Decode as Decode exposing (..)


type alias Model =
    { findArtist : List Data.Artist.Artist
    , findAlbum : List Data.Album.Album
    , findTrack : List Data.Track.Track
    , searchQuery : String
    }


init : Model
init =
    { findArtist = []
    , findAlbum = []
    , findTrack = []
    , searchQuery = ""
    }
