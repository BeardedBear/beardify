module Data.Search exposing (Model, init)

import Data.Album exposing (..)
import Data.Artist exposing (..)
import Data.Track exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)


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
