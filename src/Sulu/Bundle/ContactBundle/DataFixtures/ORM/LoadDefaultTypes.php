<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Bundle\ContactBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\ORM\Id\AssignedGenerator;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\Persistence\ObjectManager;
use Sulu\Bundle\ContactBundle\Entity\AddressType;
use Sulu\Bundle\ContactBundle\Entity\EmailType;
use Sulu\Bundle\ContactBundle\Entity\FaxType;
use Sulu\Bundle\ContactBundle\Entity\PhoneType;
use Sulu\Bundle\ContactBundle\Entity\SocialMediaProfileType;
use Sulu\Bundle\ContactBundle\Entity\UrlType;

class LoadDefaultTypes extends AbstractFixture implements OrderedFixtureInterface
{
    public function load(ObjectManager $manager)
    {
        // Phone types.
        $metadata = $manager->getClassMetaData(PhoneType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $phoneType1 = new PhoneType();
        $phoneType1->setId(1);
        $phoneType1 = $manager->merge($phoneType1);
        $phoneType1->setName('sulu_contact.work');

        $phoneType2 = new PhoneType();
        $phoneType2->setId(2);
        $phoneType2 = $manager->merge($phoneType2);
        $phoneType2->setName('sulu_contact.private');

        $phoneType3 = new PhoneType();
        $phoneType3->setId(3);
        $phoneType3 = $manager->merge($phoneType3);
        $phoneType3->setName('sulu_contact.mobile');

        // Email types.
        $metadata = $manager->getClassMetaData(EmailType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $emailType1 = new EmailType();
        $emailType1->setId(1);
        $emailType1 = $manager->merge($emailType1);
        $emailType1->setName('sulu_contact.work');

        $this->addReference('email.type.work', $emailType1);

        $emailType2 = new EmailType();
        $emailType2->setId(2);
        $emailType2 = $manager->merge($emailType2);
        $emailType2->setName('sulu_contact.private');

        $this->addReference('email.type.private', $emailType2);

        // Address types.
        $metadata = $manager->getClassMetaData(AddressType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $addressType1 = new AddressType();
        $addressType1->setId(1);
        $addressType1 = $manager->merge($addressType1);
        $addressType1->setName('sulu_contact.work');

        $addressType2 = new AddressType();
        $addressType2->setId(2);
        $addressType2 = $manager->merge($addressType2);
        $addressType2->setName('sulu_contact.private');

        // Url types.
        $metadata = $manager->getClassMetaData(UrlType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $urlType1 = new UrlType();
        $urlType1->setId(1);
        $urlType1 = $manager->merge($urlType1);
        $urlType1->setName('sulu_contact.work');

        $urlType2 = new UrlType();
        $urlType2->setId(2);
        $urlType2 = $manager->merge($urlType2);
        $urlType2->setName('sulu_contact.private');

        // Fax types.
        $metadata = $manager->getClassMetaData(FaxType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $faxType1 = new FaxType();
        $faxType1->setId(1);
        $faxType1 = $manager->merge($faxType1);
        $faxType1->setName('sulu_contact.work');

        $faxType2 = new FaxType();
        $faxType2->setId(2);
        $faxType2 = $manager->merge($faxType2);
        $faxType2->setName('sulu_contact.private');

        // Social media profile types.
        $metadata = $manager->getClassMetaData(SocialMediaProfileType::class);
        $metadata->setIdGenerator(new AssignedGenerator());
        $metadata->setIdGeneratorType(ClassMetadata::GENERATOR_TYPE_NONE);

        $socialMediaProfileType1 = new SocialMediaProfileType();
        $socialMediaProfileType1->setId(1);
        $socialMediaProfileType1 = $manager->merge($socialMediaProfileType1);
        $socialMediaProfileType1->setName('Facebook');

        $socialMediaProfileType2 = new SocialMediaProfileType();
        $socialMediaProfileType2->setId(2);
        $socialMediaProfileType2 = $manager->merge($socialMediaProfileType2);
        $socialMediaProfileType2->setName('Twitter');

        $socialMediaProfileType3 = new SocialMediaProfileType();
        $socialMediaProfileType3->setId(3);
        $socialMediaProfileType3 = $manager->merge($socialMediaProfileType3);
        $socialMediaProfileType3->setName('Instagram');

        $manager->flush();
    }

    public function getOrder()
    {
        return 2;
    }
}
