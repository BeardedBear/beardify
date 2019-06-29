module Data.Releases exposing (Model, ThePrpReleases, decodeThePrpReleases, init)

import Data.Album exposing (Album)
import Json.Decode as Decode exposing (Decoder(..), field)


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
    , date : Int
    }


decodeThePrpReleases : Decode.Decoder ThePrpReleases
decodeThePrpReleases =
    Decode.map3 ThePrpReleases
        (Decode.field "artist" Decode.string)
        (Decode.field "album" Decode.string)
        (Decode.field "date" Decode.int)
