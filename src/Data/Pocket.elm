module Data.Pocket exposing (Model, init)


type alias Model =
    { tracks : List String
    }


init : Model
init =
    { tracks = []
    }
