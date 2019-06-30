module Page.Playlist exposing (Msg(..), init, update, view)

import Data.Image
import Data.Meta exposing (PagingModel, PlaylistModel)
import Data.Playlist
    exposing
        ( Playlist
        , PlaylistId
        , PlaylistPaging
        , decodePlaylist
        , decodePlaylistPaging
        , playlistInit
        )
import Data.Session exposing (Session)
import Html exposing (Html, a, div, i, text)
import Html.Attributes exposing (class, classList, title)
import Html.Events exposing (onClick)
import Http
import List.Extra as LE
import Request
import Utils
import Views.Artist


init : PlaylistId -> Session -> ( PlaylistModel, Cmd Msg )
init playlistId session =
    ( { playlist = playlistInit
      , tracks =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetPlaylistTracks <| Request.get "playlists/" playlistId "/tracks" decodePlaylistPaging session.token
        , Http.send SetPlaylist <| Request.get "playlists/" playlistId "" decodePlaylist session.token
        ]
    )


type Msg
    = SetPlaylist (Result Http.Error Playlist)
    | SetPlaylistTracks (Result Http.Error PlaylistPaging)
    | PlayTracks (List String)


update : Session -> Msg -> PlaylistModel -> ( PlaylistModel, Cmd Msg )
update session msg model =
    case msg of
        SetPlaylist (Ok playlist) ->
            ( { model | playlist = playlist }
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
                |> LE.dropWhile (\track -> track.uri /= id)
                |> List.map (\track -> track.uri)

        trackItem track =
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
                    , ( "active", track.uri == session.player.item.uri )
                    ]
                ]
                [ icon
                , div
                    [ class "track-title"
                    , title track.name
                    , onClick <| PlayTracks (listTracksUri track.uri)
                    ]
                    [ text track.name ]
                , div [ class "track-artist" ] [ Views.Artist.view track.artists ]
                , div [ class "track-album", title track.album.name ]
                    [ releaseType track.album.album_type
                    , a [] [ text track.album.name ]
                    ]
                , div [] [ text (Utils.durationFormat track.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks.items
                |> List.map (\track -> track.duration_ms)
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
