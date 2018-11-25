module Page.Collection exposing (Model, Msg, init, update, view)

import Css exposing (fontSize, marginRight)
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


type alias Model =
    { collection : Playlist
    , albums : PlaylistPaging
    }


init : Session -> ( Model, Cmd Msg )
init session =
    ( { collection = Playlist.init
      , albums =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetCollection <| Request.get "playlists/" (getId session.url) "" decodePlaylist session.token

        -- , Http.send SetCollectionTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging session.token
        ]
    )


getId : Url -> String
getId url =
    case url.fragment of
        Just e ->
            e |> String.split "/" |> List.take 3 |> List.drop 2 |> String.concat

        _ ->
            String.fromFloat e


type Msg
    = SetCollection (Result Http.Error Playlist)



-- | SetCollectionTracks (Result Http.Error PlaylistPaging)
-- | SetCollectionTracksPaging (Result Http.Error PlaylistPaging)


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update _ msg model =
    case msg of
        SetCollection (Ok e) ->
            ( { model | collection = e }
            , Cmd.none
            )

        SetCollection (Err e) ->
            ( model, Cmd.none )



-- SetCollectionTracksPaging (Ok e) ->
--     let
--         concat =
--             model.drawer.drawerCollection.tracks.items ++ e.items
--     in
--     ( { model
--         | drawer =
--             { drawer
--                 | drawerCollection =
--                     { playlist =
--                         { id = model.drawer.drawerCollection.playlist.id
--                         , images = model.drawer.drawerCollection.playlist.images
--                         , name = model.drawer.drawerCollection.playlist.name
--                         , uri = model.drawer.drawerCollection.playlist.uri
--                         }
--                     , tracks =
--                         { items = concat
--                         , next = ""
--                         }
--                     }
--             }
--       }
--     , if e.next /= "" then
--         Cmd.batch [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]
--       else
--         Cmd.none
--     )
-- SetCollectionTracksPaging (Err _) ->
--     ( model, Cmd.none )
-- SetCollectionTracks (Ok e) ->
--     let
--         trackss =
--             { catchDrawerCollection | tracks = e }
--     in
--     ( { model | drawer = { drawer | drawerCollection = trackss } }
--     , if e.next /= "" then
--         Cmd.batch [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]
--       else
--         Cmd.none
--     )
-- SetCollectionTracks (Err _) ->
--     ( model, Cmd.none )


view : Session -> Model -> ( String, List (Html Msg) )
view session model =
    let
        _ =
            Debug.log "url" model
    in
    ( "Collection"
    , [ div []
            [ div [] [ text "Collection" ]
            ]
      , div [ class "topbar" ] [ text "" ]
      , div [ class "player" ] [ text "player" ]
      ]
    )
