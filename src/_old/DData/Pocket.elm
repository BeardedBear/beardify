module Data.Pocket exposing (Model, PocketTrack, init)


type alias Model =
    { tracks : List PocketTrack
    }


type alias PocketTrack =
    { artist : String
    , track : String
    , uri : String
    }


init : Model
init =
    { tracks = []
    }
