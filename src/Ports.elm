port module Ports exposing
    ( -- getReleasesThePRP
      refreshToken
      -- , thePrpReleases
    )

import Json.Decode as Decode
import Json.Encode as Encode


port refreshToken : () -> Cmd msg



-- port getReleasesThePRP : () -> Cmd msg
-- port thePrpReleases : (String -> msg) -> Sub msg
