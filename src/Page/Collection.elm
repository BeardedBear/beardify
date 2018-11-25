module Page.Collection exposing (Model, Msg, init, update, view)

import Css exposing (fontSize, marginRight)
import Data.Playlist as Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route
import Url exposing (percentDecode)
import Url.Parser as Parser exposing ((</>), Parser)


type alias Model =
    { collection : Playlist
    , albums : PlaylistPaging
    }


type Msg
    = Inc


init : Session -> ( Model, Cmd Msg )
init session =
    ( { collection = Playlist.init
      , albums =
            { items = []
            , next = ""
            }
      }
    , Cmd.none
    )


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update _ msg model =
    case msg of
        Inc ->
            ( model
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view session model =
    let
        _ =
            Debug.log "url" session.url
    in
    ( "Collection"
    , [ div []
            [ div [] [ text "Collection" ]
            ]
      , div [ class "topbar" ] [ text "" ]
      , div [ class "player" ] [ text "player" ]
      ]
    )
