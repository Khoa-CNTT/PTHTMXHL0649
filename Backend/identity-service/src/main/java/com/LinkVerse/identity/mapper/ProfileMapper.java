package com.LinkVerse.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.LinkVerse.identity.dto.request.ProfileCreationRequest;
import com.LinkVerse.identity.dto.request.ProfileUpdateRequest;
import com.LinkVerse.identity.dto.request.UserCreationRequest;
import com.LinkVerse.identity.dto.request.UserUpdateRequest;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    @Mapping(target = "dateOfBirth", source = "dateOfBirth")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "gender", source = "gender")
    @Mapping(target = "createdAt", ignore = true)
    ProfileCreationRequest toProfileCreationRequest(UserCreationRequest request);

    @Mapping(target = "username", source = "username")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "city", source = "city")
    @Mapping(target = "gender", source = "gender")
    @Mapping(target = "imageUrl", source = "imageUrl")
    ProfileUpdateRequest toProfileUpdateRequest(UserUpdateRequest request);
}
