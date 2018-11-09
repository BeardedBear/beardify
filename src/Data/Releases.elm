module Data.Releases exposing (Model, init)

import Data.Album exposing (..)


type alias Model =
    { releaseList : List Album
    }


init : Model
init =
    { releaseList = []
    }
