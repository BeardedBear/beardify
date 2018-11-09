module Data.Releases exposing (Model, ThePrpReleases, decodeThePrpReleases, init)

import Data.Album exposing (..)
import Json.Decode as Decode exposing (..)


type alias Model =
    { releaseList : List Album
    , thePrp : List ThePrpReleases
    }


init : Model
init =
    { releaseList = []
    , thePrp = []
    }


type alias ThePrpReleases =
    { artist : String
    , album : String
    , date : String
    }


decodeThePrpReleases : Decode.Decoder ThePrpReleases
decodeThePrpReleases =
    Decode.map3 ThePrpReleases
        (Decode.field "artist" Decode.string)
        (Decode.field "album" Decode.string)
        (Decode.field "date" Decode.string)
