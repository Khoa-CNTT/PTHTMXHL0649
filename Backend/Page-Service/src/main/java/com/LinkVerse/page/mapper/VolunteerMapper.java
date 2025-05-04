package com.LinkVerse.page.mapper;

import com.LinkVerse.page.dto.response.VolunteerResponse;
import com.LinkVerse.page.entity.Volunteer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface VolunteerMapper {


    VolunteerResponse toVolunteerResponse(Volunteer volunteer);
}