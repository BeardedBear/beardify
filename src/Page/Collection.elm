module Page.Collection exposing (Msg, init, update, view)

import Data.Image
import Data.Meta
import Data.Playlist
import Data.Session
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Request.Request as Request
import Route
import Utils


init : Data.Session.Session -> ( Data.Meta.CollectionModel, Cmd Msg )
init session =
    ( { collection = Data.Playlist.init
      , albums =
            { items = []
            , next = ""
            }
      }
    , Cmd.batch
        [ Http.send SetCollection <| Request.get "playlists/" (Utils.getId session.url) "" Data.Playlist.decodePlaylist session.token
        , Http.send SetCollectionTracks <| Request.get "playlists/" (Utils.getId session.url) "/tracks" Data.Playlist.decodePlaylistPaging session.token
        ]
    )


type Msg
    = SetCollection (Result Http.Error Data.Playlist.Playlist)
    | SetCollectionTracks (Result Http.Error Data.Playlist.PlaylistPaging)


update : Data.Session.Session -> Msg -> Data.Meta.CollectionModel -> ( Data.Meta.CollectionModel, Cmd Msg )
update session msg model =
    case msg of
        SetCollection (Ok e) ->
            ( { model | collection = e }
            , Cmd.none
            )

        SetCollection (Err e) ->
            ( model, Cmd.none )

        SetCollectionTracks (Ok e) ->
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
                Cmd.batch [ Http.send SetCollectionTracks <| Request.getPaging e.next Data.Playlist.decodePlaylistPaging session.token ]

              else
                Cmd.none
            )

        SetCollectionTracks (Err e) ->
            ( model, Cmd.none )


view : Data.Session.Session -> Data.Meta.CollectionModel -> ( String, List (Html Msg) )
view session model =
    let
        albums =
            model.albums.items
                |> List.map
                    (\a ->
                        { artists = a.track.artists
                        , album = a.track.album.name
                        , albumId = a.track.album.id
                        , albumUri = a.track.album.uri
                        , release_date = a.track.album.release_date
                        , images = a.track.album.images
                        , trackUri = a.track.uri
                        }
                    )

        albumItem al =
            div [ classList [ ( "album", True ) ] ]
                [ a [ Route.href (Route.Album al.albumId), class "img" ] [ Data.Image.imageView Data.Image.Medium al.images ]
                , div [] [ text al.album ]
                , div []
                    (al.artists
                        |> List.map
                            (\ar ->
                                a
                                    [ Route.href (Route.Artist ar.id)
                                    , class "artist-name"
                                    ]
                                    [ text ar.name ]
                            )
                    )
                , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")" ]
                , div [ class "playing-btn" ] [ i [ class "icon-play" ] [] ]
                , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                , div [ class "del-btn" ] [ i [ class "icon-del" ] [] ]
                ]
    in
    ( model.collection.name
    , [ div []
            [ div [ class "heading-page" ] [ text <| String.replace "#Collection " "" model.collection.name ]
            , div []
                [ albums
                    |> List.map albumItem
                    |> div [ class "album-list-wrapper" ]
                ]
            ]
      ]
    )
