module Data.Modal exposing (Model, init)


type alias Model =
    { isOpen : Bool
    , inPocket : List String
    }


init : Model
init =
    { isOpen = False
    , inPocket = []
    }
