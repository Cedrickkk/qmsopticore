<?php

namespace App\Enums;

enum DepartmentEnum: string
{
    case OfficeOfPresident = 'OP';
    case OfficeOfVicePresident = 'OVP';
    case HumanResource = 'HR';
    case Registrar = 'RR';
    case QualityAssuranceOffice = 'QA';
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
            self::OfficeOfPresident => 'Office of the President',
            self::OfficeOfVicePresident => 'Office of the Vice President',
            self::HumanResource => 'Human Resources Department',
            self::Registrar => 'Registrar',
            self::QualityAssuranceOffice => 'Quality Assurance Office',
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
