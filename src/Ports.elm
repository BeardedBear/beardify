port module Ports exposing (saveStore, storeChanged)

import Json.Encode as Encode


port saveStore : String -> Cmd msg


port storeChanged : (String -> msg) -> Sub msg
