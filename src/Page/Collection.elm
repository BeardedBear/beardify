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
        , Http.send SetCollectionTracks <| Request.get "playlists/" (getId session.url) "/tracks" decodePlaylistPaging session.token
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
    | SetCollectionTracks (Result Http.Error PlaylistPaging)
    | SetCollectionTracksPaging (Result Http.Error PlaylistPaging)


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update session msg model =
    case msg of
        SetCollection (Ok e) ->
            ( { model | collection = e }
            , Cmd.none
            )

        SetCollection (Err e) ->
            ( model, Cmd.none )

        SetCollectionTracks (Ok e) ->
            ( { model | albums = e }
            , if e.next /= "" then
                Cmd.batch
                    [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging session.token
                    ]

              else
                Cmd.none
            )

        SetCollectionTracks (Err _) ->
            ( model, Cmd.none )

        SetCollectionTracksPaging (Ok e) ->
            let
                concat =
                    model.albums.items ++ e.items
            in
            ( { model
                | albums =
                    { items = concat
                    , next = ""
                    }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetCollectionTracksPaging (Err _) ->
            ( model, Cmd.none )


view : Session -> Model -> ( String, List (Html Msg) )
view session model =
    let
        _ =
            Debug.log "url" model.albums.items
    in
    ( "Collection"
    , [ div []
            [ div []
                [ text "Collection"
                , div []
                    (model.albums.items |> List.map (\e -> div [] [ text e.track.album.name ]))
                ]
            ]
      , div [ class "topbar" ] [ text "" ]
      , div [ class "player" ] [ text "player" ]
      ]
    )
