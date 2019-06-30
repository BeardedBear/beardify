module Page.Playlist exposing (Msg(..), init, update, view)

import Data.Image
import Data.Meta exposing (PlaylistModel)
import Data.Playlist exposing (Playlist, PlaylistPaging, decodePlaylist, decodePlaylistPaging, playlistInit)
import Data.Session exposing (Session)
import Html exposing (Html, a, div, i, text)
import Html.Attributes exposing (class, classList, title)
import Html.Events exposing (onClick)
import Http
import List.Extra as LE
import Request
import Utils
import Views.Artist


init : String -> Session -> ( PlaylistModel, Cmd Msg )
init id session =
    ( { playlist = playlistInit
      , tracks =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging session.token
        , Http.send SetPlaylist <| Request.get "playlists/" id "" decodePlaylist session.token
        ]
    )


type Msg
    = SetPlaylist (Result Http.Error Playlist)
    | SetPlaylistTracks (Result Http.Error PlaylistPaging)
    | PlayTracks (List String)


update : Session -> Msg -> PlaylistModel -> ( PlaylistModel, Cmd Msg )
update session msg model =
    case msg of
        SetPlaylist (Ok e) ->
            ( { model | playlist = e }
            , Cmd.none
            )

        SetPlaylist (Err _) ->
            ( model, Cmd.none )

        SetPlaylistTracks (Ok e) ->
            let
                concat =
                    model.tracks.items ++ e.items
            in
            ( { model
                | tracks = { items = concat, next = "" }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracks <| Request.getPaging e.next decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )

        PlayTracks _ ->
            ( model, Cmd.none )


view : Session -> PlaylistModel -> ( String, List (Html Msg) )
view session model =
    let
        listTracksUri id =
            model.tracks.items
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            let
                icon =
                    div [] [ i [ class "icon-music" ] [] ]

                releaseType r =
                    case r of
                        "album" ->
                            i [ class "icon-discogs" ] []

                        "single" ->
                            i [ class "icon-pizza" ] []

                        _ ->
                            i [ class "icon-music" ] []
            in
            div
                [ classList
                    [ ( "track playlist-page", True )
                    , ( "active", t.uri == session.player.item.uri )
                    ]
                ]
                [ icon
                , div
                    [ class "track-title"
                    , title t.name
                    , onClick <| PlayTracks (listTracksUri t.uri)
                    ]
                    [ text t.name ]
                , div [ class "track-artist" ] [ Views.Artist.artistList t.artists ]
                , div [ class "track-album", title t.album.name ]
                    [ releaseType t.album.album_type
                    , a [] [ text t.album.name ]
                    ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks.items
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    ( model.playlist.name
    , [ div [ class "album-wrapper" ]
            [ div [ class "album-page-head" ]
                [ div [ class "heading-page" ] [ text model.playlist.name ]
                ]
            , div [ class "album-page" ]
                [ div []
                    [ Data.Image.imageView Data.Image.Medium model.playlist.images
                    , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                    ]
                , div []
                    [ div [] (model.tracks.items |> List.map trackItem)
                    ]
                ]
            ]
      ]
    )
