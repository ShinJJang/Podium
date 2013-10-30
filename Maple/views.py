# -*- coding: utf-8 -*-
from django.shortcuts import redirect, render, render_to_response
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseServerError
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.db.models import Q
from .models import *
from django.conf import settings

from base64 import b64encode
from datetime import datetime, timedelta
from json import dumps
from mimetypes import guess_type
from os import path
from uuid import uuid4
import time
import hmac
import hashlib
import json

import sys
reload(sys)
sys.setdefaultencoding("utf-8")

@login_required
def home(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    ctx = Context({
        'user': user,
        'page_title': 'Podium'
    })
    return render(request, 'index.html', ctx)


@login_required
def poll(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    ctx = Context({
        'user': user,
        'page_title': 'Podium Poll'
    })
    return render(request, 'poll.html', ctx)


@login_required
def pui(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    ctx = Context({
        'user': user,
        'page_title': 'PUI Framework'
    })
    return render(request, 'pui.html', ctx)


@login_required
def people(request, people_id):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    user_pageowner = User.objects.get(id=people_id)
    ctx = Context({
        'user': user,
        'user_pageowner': user_pageowner
    })
    return render(request, 'profile.html', ctx)


@login_required
def private(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    ctx = Context({
        'user': user,
    })
    return render(request, 'private.html', ctx)

@login_required
def group(request, group_id):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    group = Groups.objects.get(id=group_id)

    permission = -1
    try:
        membership = Memberships.objects.filter(user_key=user, group_key=group)[0]
        permission = membership.permission
    except:
        pass

    if group.open_scope == 2 and permission == -1:
        return home(request)  # TODO - 비공개 그룹 페이지 안내 화면 추가 -> 주소 바꾸는 방법도

    ctx = Context({
        'user': user,
        'group': group,
        'permission': permission
    })
    return render(request, 'group.html', ctx)

@login_required
def group_create(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    ctx = Context({
        'user': user,
    })
    return render(request, 'group_create.html', ctx)

@login_required
def group_settings(request, group_id):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    group = Groups.objects.get(id=group_id)

    permission = -1
    try:
        membership = Memberships.objects.filter(user_key=user, group_key=group)[0]
        permission = membership.permission
    except:
        pass

    ctx = Context({
        'user': user,
        'group': group,
        'permission': permission
    })
    return render(request, 'group_settings.html', ctx)

@login_required
def get_chat_list(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    chat_rooms = ChatRoom.objects.filter(chatparticipants__user_key=user).distinct().order_by('-userchattingmessage__created')
    chat_room = []
    for room in chat_rooms:
        chat_room_item = {}
        chat_room_item['room_id'] = room.id
        last_message = UserChattingMessage.objects.filter(chat_room_key=room).order_by('-created')
        try:
            chat_room_item['last_message_speaker'] = last_message[0].chatting_message
            chat_room_item['last_message'] = last_message[0].user_key.id
        except:
            chat_room_item['last_message_speaker'] = 'null'
            chat_room_item['last_message'] = 'null'
        chat_room_participants = ChatParticipants.objects.filter(chat_room_key=room)
        i = 1
        for participant in chat_room_participants:
            participant_item = {}
            participant_item['participant_id'] = participant.user_key.id
            participant_item['participant_name'] = participant.user_key.username
            participant_picture = UserPictures.objects.filter(user_key=participant.user_key).order_by('-created')
            try:
                participant_item['participant_picture'] = participant_picture[0].picture
            except:
                participant_item['participant_picture'] = 'null'
            chat_room_item['participant_' + str(i)] = participant_item
            i = i + 1
        chat_room.append(chat_room_item)
        i = 1
    print chat_room
    return HttpResponse(json.dumps(chat_room), content_type='application/json')

def sign_s3(request): #request에 메서드, 유저아이디는 x db조회, 파일 카운트를 추가.오브젝트네임이 키값이다.

    AWS_ACCESS_KEY = "AKIAJKZRCQKYZ7EHIXYA"
    AWS_SECRET_KEY = "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"
    S3_BUCKET = "somapodium"
    object_name = request.GET.get('s3_object_name')
    print object_name.encode('utf-8')
    print dumps(object_name).decode("UTF-8")
    print unicode(object_name).encode('utf-8')
    mime_type = request.GET.get('s3_object_type')
    method = request.GET.get('s3_method')
    file_count = request.GET.get('s3_file_count')
    expires = int(time.time() + 10)
    amz_headers = "x-amz-acl:public-read"
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자

    put_request = "%s\n\n%s\n%d\n%s\n/%s/%s/%s/%s" % (method, mime_type, expires, amz_headers, S3_BUCKET, str(user_id), file_count, object_name)
    print unicode(put_request).encode("utf-8")
    hashed = hmac.new(AWS_SECRET_KEY, put_request, hashlib.sha1)

    signature = b64encode(hashed.digest())

    url = 'https://%s.s3.amazonaws.com/%s/%s/%s' % (S3_BUCKET, str(user_id), file_count, object_name)
    signed_request = '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature)
    print url
    print signed_request
    return HttpResponse(json.dumps({
        'signed_request': signed_request,
        'url': url
    }), content_type='application/json')

def get_file_count(request): #request에 메서드, 유저아이디는 x db조회, 파일 카운트를 추가.오브젝트네임이 키값이다.
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)   # 현재 로그인된 사용자
    object_file_count, user_file_count = UserFileCount.objects.get_or_create(user_key = user)
    print object_file_count.file_count
    return HttpResponse(object_file_count.file_count)

@login_required
def chat(request):
    users = User.objects.select_related().all()[0:100]
    ctx = Context({
        'users': users
    })
    return render(request, 'chat_index.html', ctx)


@login_required
def invite_chat(request):
    invite_people = request.GET.get("chatting_user", "")
    print "chating_user = " + invite_people
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    chatting_user = User.objects.get(id=invite_people)
    chat_information = ChatInformation.objects.all()
    #유저별로 노티피케이션을 줘야 하는데.?
    chat_info = chat_information.filter(
        Q(user_key=user) | Q(user_key=chatting_user))

    print chat_info
    try:
        ChatTables.objects.get(from_chatting_user=user, to_chatting_user=chatting_user)
    except:
        try:
            ChatTables.objects.get(from_chatting_user=chatting_user, to_chatting_user=user)#양쪽으로 채팅중인 테이블이 있으면
        except:
            ChatNotis.objects.create(noti_from_user_key=user, noti_to_user_key=chatting_user)

    try: #이미 만들어져있는 채팅방이 있는지를 조회
        chat_info = UserChats.objects.get(chat_to_user_key=user, chat_from_user_key=chatting_user)
        chat_comments = ChatComments.objects.filter(userChat_key=chat_info)
        ctx = Context({
            'user': user, #리턴값은 모두 객체
            'chatting_user': chatting_user,
            'chat_info': chat_info,
            'chat_comments': chat_comments
        })
        return render_to_response('chat.html', ctx)
        #return HttpResponse(json.dumps(ctx), mimetype="application/json")
    except:
        try:
            chat_info = UserChats.objects.get(chat_to_user_key=chatting_user, chat_from_user_key=user)
            chat_comments = ChatComments.objects.filter(userChat_key=chat_info)
            ctx = Context({
                'chat_info': chat_info,
                'user': user,
                'chatting_user': chatting_user,
                'chat_comments': chat_comments
            })
            return render_to_response('chat.html', ctx)
        except:
            chat_info = UserChats.objects.create(chat_to_user_key=chatting_user, chat_from_user_key=user,
                                                 chat_room_name=str(user.id) + "to" + str(chatting_user.id))
            chat_comments = ChatComments.objects.create(userChat_key=chat_info, chat_comment="친구 초대")
            ctx = Context({
                'user': user,
                'chat_info': chat_info,
                'chatting_user': chatting_user,
                'chat_comments': chat_comments
            })
            return render_to_response('chat.html', ctx)


@login_required
def invited_chat(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    print "invited_chat event  " + user.username + " invite!"

    try:
        chat_noti = ChatNotis.objects.get(noti_to_user_key=user)#noti가 있으면 채팅 유저를 찾고
        chatting_user = User.objects.get(id=chat_noti.noti_from_user_key.id)
        try:
            ChatTables.objects.get(to_chatting_user=user, from_chatting_user=chatting_user)
        except:
            try:
                ChatTables.objects.get(to_chatting_user=chatting_user, from_chatting_user=user)
            except:
                ChatTables.objects.create(to_chatting_user=user, from_chatting_user=chatting_user)
                chat_noti.delete()

        try:
            chat_info = UserChats.objects.get(chat_to_user_key=user, chat_from_user_key=chatting_user)
        except:
            chat_info = UserChats.objects.get(chat_to_user_key=chatting_user, chat_from_user_key=user)

        chat_comments = ChatComments.objects.filter(userChat_key=chat_info)
        ctx = Context({
            'user': user,
            'chat_info': chat_info,
            'chatting_user': chatting_user,
            'chat_comments': chat_comments
        })
        return render_to_response('chat.html', ctx)
    except:
        return HttpResponse("0")


@csrf_exempt
def chat_comment(request): #chat_noti 만들어야 함
    if request.POST.get('type') == 'DELETE':
        user_chat = UserChats.objects.get(chat_room_name=request.POST.get('room_name'))
        try:
            chat_table = ChatTables.objects.get(from_chatting_user=user_chat.chat_from_user_key,
                                                to_chatting_user=user_chat.chat_to_user_key)
        except:
            chat_table = ChatTables.objects.get(from_chatting_user=user_chat.chat_to_user_key,
                                                to_chatting_user=user_chat.chat_from_user_key)
        chat_table.delete()
        return HttpResponse("Everything worked :)")
    if request.POST.get('type') == "POST":
        try:
            user_chat = UserChats.objects.get(chat_room_name=request.POST.get('room_name'))
            print user_chat.chat_room_name
            user = User.objects.get(id=request.POST.get('user_id'))
            chat_comment = user.username + ": " + request.POST.get('comment')
            ChatComments.objects.create(userChat_key=user_chat, chat_comment=chat_comment)
            print request.POST.get('comment')
            return HttpResponse("Everything worked :)")
        except Exception, e:
            return HttpResponseServerError(str(e))


@login_required
def chatInfo_create_or_get(request):
    invite_people = request.GET.get("chatting_user", "")
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    chatting_user = User.objects.get(id=invite_people)
    chat_information = ChatInformation.objects.all()
    #유저별로 노티피케이션을 줘야 하는데.?
    try:
        chat_info = chat_information.participants_set.filter(
            Q(user_key=user), Q(user_key=chatting_user)
        )#채팅정보가 있으면 해당 채팅정보를 이용해 전달
        #chatinformation과 연관된 참여자들을 가져와 socket connect가 false인 참여자에게 노티를 준다.
        chat_messages = ChatMessages.objects.filter(chatInfo_key=chat_info)

        ctx = Context({
            'user': user, #리턴값은 모두 객체
            'chatting_user': chatting_user,
            'chat_info': chat_info,
            'chat_comments': chat_messages
        })
        return render_to_response('chat.html', ctx)

    except:
        chat_info = ChatInformation.objects.create(room_name=str(user.id) + "to" + str(chatting_user.id))
        chat_mesages = ChatMessages.objects.create(chatInfo_key=chat_info, user_key=user, comment='채팅방 개설')
        participant = Participants.objects.create(chatInfo_key=chat_info, user_key=user, socket_connect=True)
        ctx = Context({
            'user': user, #리턴값은 모두 객체
            'chatting_user': chatting_user,
            'chat_info': chat_info,
            'chat_comments': chat_messages
        })
        ChatNotifications.objects.create(chatInfo_key=chat_info, from_user_key=user, to_user_key=chatting_user)#1:1알림
        return render_to_response('chat.html', ctx)


@login_required
def invited_chat_poll(request):
    session = Session.objects.get(session_key=request.session._session_key)
    user_id = session.get_decoded().get('_auth_user_id')
    user = User.objects.get(id=user_id)
    print "invited_chat event  " + user.username + " invite!"

    try:
        chat_notification = ChatNotifications.objects.get(to_user_key=user)
        chat_info = ChatInformation.objects.get(id=chat_notification.chatInfo_key)
        chat_messages = ChatComments.objects.filter(chatInfo_key=chat_info)
        try:
            participant = Participants.objects.get(chatInfo_key=chat_notification.chatInfo_key, user_key=user)
            if participant.socket_connect == False:
                participant.socket_connect = True
                participant.save()
        except:
            Participants.objects.create(chatInfo_key=chat_notification.chatInfo_key, user_key=user, socket_connect=True)
        chat_notification.delete()
        ctx = Context({
            'user': user,
            'chat_info': chat_info,
            'chatting_user': chatting_user,
            'chat_comments': chat_messages
        })
        return render_to_response('chat.html', ctx)
    except:
        return HttpResponse("0")


@csrf_exempt
def chat_messages(request): #chat_noti 만들어야 함
    if request.POST.get('type') == 'DELETE': #참가자의 소켓 커넥트를 폴스로 바꿔야 한다.
        user_chat = UserChats.objects.get(chat_room_name=request.POST.get('room_name'))
        try:
            chat_table = ChatTables.objects.get(from_chatting_user=user_chat.chat_from_user_key,
                                                to_chatting_user=user_chat.chat_to_user_key)
        except:
            chat_table = ChatTables.objects.get(from_chatting_user=user_chat.chat_to_user_key,
                                                to_chatting_user=user_chat.chat_from_user_key)
        chat_table.delete()
        return HttpResponse("Everything worked :)")
    if request.POST.get('type') == "POST":
        try:
            user_chat = UserChats.objects.get(chat_room_name=request.POST.get('room_name'))
            print user_chat.chat_room_name
            user = User.objects.get(id=request.POST.get('user_id'))
            chat_comment = user.username + ": " + request.POST.get('comment')
            ChatComments.objects.create(userChat_key=user_chat, chat_comment=chat_comment)
            print request.POST.get('comment')
            return HttpResponse("Everything worked :)")
        except Exception, e:
            return HttpResponseServerError(str(e))

