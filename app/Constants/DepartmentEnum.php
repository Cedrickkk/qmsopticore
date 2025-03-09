<?php

namespace App\Constants;

enum DepartmentEnum: string
{
    case HumanResource = 'HR';
    case Registrar = 'RR';
    case CollegeOfComputerStudies = 'CCS';
    case CollegeOfNursing = 'CON';
    case CollegeOfEducation = 'COED';
    case CollegeOfEngineering = 'COE';
    case CollegeOfArtsAndScience = 'CAS';
    case CollegeOfBusinessAndAccountancy = 'CBA';
    case CollegeOfHospitalityManagement = 'CHM';

    public function label(): string
    {
        return match ($this) {
            self::HumanResource => 'Human Resource Department',
            self::Registrar => 'Registrar',
            self::CollegeOfComputerStudies => 'College of Computer Studies',
            self::CollegeOfNursing => 'College of Nursing',
            self::CollegeOfEducation => 'College of Education',
            self::CollegeOfEngineering => 'College of Engineering',
            self::CollegeOfArtsAndScience => 'College of Arts and Science',
            self::CollegeOfBusinessAndAccountancy => 'College of Business and Accountancy',
            self::CollegeOfHospitalityManagement => 'College of Hospitality Management',
        };
    }
}
