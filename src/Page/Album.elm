module Page.Album exposing (Msg, init, update, view)

import Data.Album
import Data.Playlist as Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Request.Request as Request
import Route
import Url exposing (Url, percentDecode)
import Url.Parser as Parser exposing ((</>), Parser)
import Utils


init : Session -> ( Data.Album.Model, Cmd Msg )
init session =
    ( Data.Album.init
    , Cmd.batch
        []
    )


type Msg
    = NoOp


update : Session -> Msg -> Data.Album.Model -> ( Data.Album.Model, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model
            , Cmd.none
            )


view : Session -> Data.Album.Model -> ( String, List (Html Msg) )
view session model =
    ( "Collection"
    , [ div [ class "topbar" ] [ text "" ]
      , div [ class "drawer" ] [ text <| Utils.getId session.url ]
      , div [ class "player" ] [ text "player" ]
      ]
    )
