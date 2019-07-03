module Page.Playlist exposing (Msg(..), init, update, view)

import Data.Image exposing (ImageSize(..), imageView)
import Data.Meta exposing (PlaylistModel)
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
import Data.Track exposing (Track)
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


trackView : Session -> PlaylistModel -> Track -> Html Msg
trackView session model track =
    let
        listTracksUri id =
            model.tracks.items
                |> LE.dropWhile (\trackItem -> trackItem.uri /= id)
                |> List.map (\trackItem -> trackItem.uri)

        releaseType release =
            case release of
                "album" ->
                    i [ class "Track__icon album icon-discogs" ] []

                "single" ->
                    i [ class "Track__icon ep icon-pizza" ] []

                _ ->
                    i [ class "Track__icon track icon-music" ] []
    in
    div
        [ classList
            [ ( "Track playlist", True )
            , ( "active", track.uri == session.player.item.uri )
            ]
        ]
        [ div [] [ i [ class "Track__icon track icon-music" ] [] ]
        , div
            [ class "Track__section overflow"
            , title track.name
            , onClick <| PlayTracks (listTracksUri track.uri)
            ]
            [ text track.name ]
        , div [ class "Track__section overflow" ] [ Views.Artist.view track.artists ]
        , div [ class "Track__section overflow", title track.album.name ]
            [ releaseType track.album.album_type
            , a [] [ text track.album.name ]
            ]
        , div [ class "Track__section" ] [ text (Utils.durationFormat track.duration_ms) ]
        ]


view : Session -> PlaylistModel -> ( String, List (Html Msg) )
view session model =
    let
        trackSumDuration =
            model.tracks.items
                |> List.map (\track -> track.duration_ms)
                |> List.sum
    in
    ( model.playlist.name
    , [ div [ class "Page__content" ]
            [ div [ class "Title" ] [ text model.playlist.name ]
            , div [ class "PageAlbum" ]
                [ div []
                    [ imageView Medium "Cover" model.playlist.images
                    , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                    ]
                , div []
                    (model.tracks.items
                        |> List.map (trackView session model)
                    )
                ]
            ]
      ]
    )
