module Page.Playlist exposing (Msg, init, update, view)

import Data.Image
import Data.Meta
import Data.Playlist
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import List.Extra as LE
import Request
import Utils
import Views.Artist


init : String -> Data.Session.Session -> ( Data.Meta.PlaylistModel, Cmd Msg )
init id session =
    ( { playlist = Data.Playlist.init
      , tracks =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetPlaylistTracks <| Request.get "playlists/" id "/tracks" Data.Playlist.decodePlaylistPaging session.token
        , Http.send SetPlaylist <| Request.get "playlists/" id "" Data.Playlist.decodePlaylist session.token
        ]
    )


type Msg
    = SetPlaylist (Result Http.Error Data.Playlist.Playlist)
    | SetPlaylistTracks (Result Http.Error Data.Playlist.PlaylistPaging)


update : Data.Session.Session -> Msg -> Data.Meta.PlaylistModel -> ( Data.Meta.PlaylistModel, Cmd Msg )
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
                Cmd.batch [ Http.send SetPlaylistTracks <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.PlaylistModel -> ( String, List (Html Msg) )
view session model =
    let
        listTracksUri id =
            model.tracks.items
                |> LE.dropWhile (\e -> e.track.uri /= id)
                |> List.map (\k -> k.track.uri)

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
                    ]
                ]
                [ icon
                , div
                    [ class "track-title"
                    , title t.track.name
                    ]
                    [ text t.track.name ]
                , div [ class "track-artist" ] [ Views.Artist.artistList t.track.artists ]
                , div [ class "track-album", title t.track.album.name ]
                    [ releaseType t.track.album.album_type
                    , a [] [ text t.track.album.name ]
                    ]
                , div [] [ text (Utils.durationFormat t.track.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks.items
                |> List.map (\d -> d.track.duration_ms)
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
